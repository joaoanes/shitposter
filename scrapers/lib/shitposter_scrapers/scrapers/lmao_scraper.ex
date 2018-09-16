  defmodule ShitposterScrapers.Scrapers.LMAOScraper do
  alias ShitposterScrapers.Repo
  alias ShitposterScrapers.Scrapers.Scraper
  alias ShitposterScrapers.Scrapers
  alias ShitposterScrapers.Submissions
  alias Junkyard
  import IEx


  def scrape do
    Scrapers.find_or_create("LMAOBOT3000")
      |> parse_threads

  end

  def scrape_test do
    Scrapers.find_or_create("LMAOBOT3000")
      |> parse_thread("utuy")
  end

  def scrape_thread_ids do
    "https://forum.facepunch.com/search/?q=LMAO+(pictures+%7C%7C+pics)+v&type=Thread&forum=12"
      |> HTTPoison.get
      |> Junkyard.ok!
      |> Map.get(:body)
      |> Floki.find(".searchheader a")
      |> Floki.attribute("href")
      |> Enum.map(fn url ->
        Regex.scan(~r/\/f\/fastthread\/([a-z]*)\/.*/, url)
      end)
      |> Enum.map(&(
        List.last(
          List.last(&1)
        )
      ))
      |> Enum.sort(&(
        thread_id_to_integer(&1) < thread_id_to_integer(&2)
      ))
  end

  def base26_to_int id do
    Enum.reduce(
      id,
      [Kernel.length(id) - 1, 0],
      fn (x, [i, a]) -> [i-1, x * (:math.pow(26, i)) + a]
    end)
  end

  def thread_id_to_integer id do
    String.graphemes(id)
      |> Enum.map(fn x -> <<x::utf8>> = x; x - ?a + 1 end)
      |> base26_to_int
      |> List.last
  end

  def unparsed_thread_ids scraper do
    last_thread_id = scraper.current_thread_id || "a"

    all_ids = scrape_thread_ids

    case (last_thread_id) do
      nil -> all_ids
      thread_id ->
        int_thread_id = thread_id_to_integer(thread_id)
        all_ids
          |> Enum.filter(&(
            thread_id_to_integer(&1) > int_thread_id
          ))
    end
  end


  def thread_size(thread_id) do
    req = "https://forum.facepunch.com/f/fastthread/#{thread_id}/1/?json=1" |> HTTPoison.get

    case req do
      {:ok, res} -> (
        %{"PerPage" => per_page, "Total" => total} = res
          |> Map.get(:body)
          |> Poison.decode
          |> Junkyard.ok!
          |> Map.get("Page")
        Float.ceil(total/per_page)
      )
      {:error, error} -> {:error, error}
    end
  end

  def has_content(message) do
    case Poison.decode(message) do
      {:ok, json} -> [parse_json(json)]
      _ -> has_content_old(message)
    end
  end

  def parse_json(%{"ops" => [%{
    "insert" => %{
      "hotlink" => %{
        "url" => url
      }
    }
  } | _]}) do
    url
  end

  def parse_json(_) do
    []
  end

  def has_content_old(message) do
    content_regexes = [
      ~r/\[img\](.*?)\[\/img\]/i,
      ~r/\[video\](.*?)\[\/video\]/i,
      ~r/\[media\](.*?) \[\/media\]/i
    ]

    result_array = content_regexes
    |> Enum.map(&(
      Regex.scan(&1, message)
      |> Enum.map(fn x -> List.last(x) end)
    ))
    |> Enum.filter(fn results -> results != nil end)
    |> List.flatten

  end

  def hello a, page_id do
    IO.inspect Kernel.length(
      Enum.map(a, fn post -> post[:extracted] end)
      |> Enum.filter(fn list -> Kernel.length(list) == 1 end)
      |> IO.inspect
    )
    a
  end

  def parse_page(page_id, scraper, thread_id, final_page_id) do
    results = parse_page(page_id, scraper, thread_id)
    IO.inspect "Parsed #{page_id}/#{final_page_id}, #{Kernel.length(
      Enum.map(results, &(Map.get(&1, :extracted)))
      |> Enum.filter(fn x -> Kernel.length(x) != 0 end)
    )}"
    results
  end

  def parse_page(page_id, scraper, thread_id) do
    try do
      "https://forum.facepunch.com/f/fastthread/#{thread_id}/stuff/#{page_id}/?json=1"
        |> HTTPoison.get([], [
          follow_redirect: true,
          timeout: 15_000,
          recv_timeout: 15_000,
          hackney: [pool: :long_con]
        ])
        |> Junkyard.ok!
        |> Map.get(:body)
        |> Poison.decode
        |> Junkyard.ok!
        |> Map.get("Posts")
        |> Enum.map(fn post -> (
          content = has_content(post["Message"])
          case (content) do
            nil -> post
            _ -> Map.put(post, :extracted, content)
          end
          ) end )


    catch
      {:invalid, _, _} -> []
      e ->
        IO.inspect e
        []
    end
  end

  def parse_threads(scraper) do
    submissions = unparsed_thread_ids(scraper)
      |> Enum.map(&(
        parse_thread(scraper, &1)
      ))
      |> Enum.reduce([], &(&1 ++ &2))
  end

  def parse_thread(scraper, thread_id) do
    submissions = fetch_thread(scraper, thread_id)

    submissions
    |> Task.async_stream(
        &Submissions.push_submission/1,
        max_concurrency: 10,
        timeout: 25000
      )
    |> Enum.to_list()
    case (
      thread_id_to_integer(thread_id) >
      thread_id_to_integer(scraper.current_thread_id || "a")
    ) do
      true ->
        Scrapers.update_scraper(scraper, %{current_thread_id: thread_id})
        |> Junkyard.ok!
        IO.puts "Updated current thread to #{thread_id}"
    end
    submissions
  end

  def fetch_thread(scraper, thread_id) do
    final_thread_page = Kernel.trunc(thread_size(thread_id))

    current_thread_page = case (scraper.current_thread_id) do
      thread_id when is_number(thread_id)-> scraper.last_page_id
      _ -> 0
    end

    IO.puts "Fetching thread #{thread_id}"

    candidate_urls = Task.async_stream(
      current_thread_page..final_thread_page,
      ShitposterScrapers.Scrapers.LMAOScraper,
      :parse_page,
      [scraper, thread_id, final_thread_page],
      max_concurrency: 10,
      timeout: 20000
    )
      |> Enum.to_list()
      |> Enum.reduce([], fn {:ok, a}, acc -> acc ++ a end)
      |> Enum.map(&(Map.get(&1, :extracted, nil)))
      |> List.flatten
      |> Enum.filter(&(String.length(&1) > 0))

    try do
      submissions =
        candidate_urls
        |> Submissions.find_or_create_all
    catch
      e ->
        IEx.pry
        IO.puts "Error #{e}"
        nil
    end
  end
end
