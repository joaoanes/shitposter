  defmodule ShitposterScrapers.Scrapers.LMAOScraper do
  alias ShitposterScrapers.Repo
  alias ShitposterScrapers.Scrapers.Scraper
  alias ShitposterScrapers.Scrapers
  alias ShitposterScrapers.Submissions
  import IEx


  def scrape(scrape) do
    scraper = Scraper.find_or_create("LMAOBOT3000")

    {:ok, last_post_id} =
      Redix.command(:redix, ["GET", "lmao_last_post_id"])

    ""
    |> HTTPoison.get
    |> IO.inspect

  end

  def ok!(conditional) do
    case conditional do
      {:ok, res} -> res
      {:error, err} -> (
        throw err
      )
    end
  end

  def get_thread_size(thread_id) do
    req = "https://forum.facepunch.com/f/fastthread/#{thread_id}/1/?json=1" |> HTTPoison.get

    case req do
      {:ok, res} -> (
        %{"PerPage" => per_page, "Total" => total} = res
          |> Map.get(:body)
          |> Poison.decode
          |> ok!
          |> Map.get("Page")
        Float.ceil(total/per_page)
      )
      {:error, error} -> {:error, error}
    end
  end

  def has_content(message) do
    case Poison.decode(message) do
      {:ok, json} -> parse_json(json)
      _ -> has_content_old(message)
    end
  end

  def has_content_json(%{} = json) do
    IEx.pry
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
    nil
  end

  def has_content_old(message) do
    content_regexes = [
      ~r/\[img\](.*)\[\/img]/i,
      ~r/\[video\](.*)\[\/video]/i,
      ~r/\[media\](.*) \[\/media]/i
    ]

    result_array = Enum.map(content_regexes, fn regex -> (
      Regex.run(regex, message)
    ) end)
    |> Enum.filter(fn results -> results != nil end)

    case result_array do
      [] -> nil
      [[_, result] | _] -> result
    end
  end


  def parse_page(scraper, thread_id, page_id) do
    IO.puts("Fetching page #{page_id}")
    "https://forum.facepunch.com/f/fastthread/#{thread_id}/#{page_id}/?json=1"
      |> HTTPoison.get
      |> ok!
      |> Map.get(:body)
      |> Poison.decode
      |> ok!
      |> Map.get("Posts")
      |> Enum.map(fn post -> (
        content = has_content(post["Message"])
        case (content) do
          nil -> post
          _ -> Map.put(post, :extracted, content)
        end
      ) end )
  end

  def parse_thread(scraper, thread_id) do
    final_thread_page = Kernel.trunc(get_thread_size(thread_id))
    current_thread_page = scraper.last_page_id || 1

    candidates = Enum.map(
      current_thread_page..final_thread_page,
      fn page -> parse_page(scraper, thread_id, page) end
    )
      |> Enum.reduce([], &(&1 ++ &2))
      |> Submissions.remove_saved

    candidates = candidates |> Enum.map(
      &(Submissions.create_submission(%{
        content_url: Map.get(&1, :extracted)
        }) |> ok!)
    )

    candidates
      |> Enum.map(&Submissions.push_submission/1)

  end

  def test do
    scraper = Scrapers.find_or_create("LMAOTEST")
      |> parse_thread("bcrdj")
  end

end
