defmodule LMAOScraper do
  require Logger
  require IEx

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
    nil
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
    |> Junkyard.hello
    |> Enum.filter(fn results -> results != nil end)
    |> List.flatten

  end

  def parse_page(page_id, thread_id, final_page_id) do
    results = parse_page(page_id, thread_id)
    Logger.debug "Parsed #{page_id}/#{final_page_id}, #{Kernel.length(results)}"
    results
  end

  def parse_page(page_id, thread_id) do
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
            has_content(post["Message"])
        ) end )
        |> Enum.reject(fn ([a|_]) -> a == nil end)

    catch
      {:invalid, _, _} -> []
      e ->
        IO.inspect e
        []
    end
  end

  def parse_thread(thread_id) do
    submissions = fetch_thread(thread_id)

    submissions
    |> Task.async_stream(
        &Submissions.push_submission/1,
        max_concurrency: 10,
        timeout: 25000
      )
    |> Enum.to_list()
  end

  def fetch_thread(thread_id) do
    final_thread_page = Kernel.trunc(thread_size(thread_id))

    Logger.info "Fetching thread #{thread_id}"

    Task.async_stream(
      0..final_thread_page,
      LMAOScraper,
      :parse_page,
      [thread_id, final_thread_page],
      max_concurrency: 10,
      timeout: 20000
    )
      |> Enum.to_list()
      |> Enum.reduce([], fn {:ok, a}, acc -> acc ++ a end)
      |> List.flatten
      |> Enum.filter(&(String.length(&1) > 0))
  end

end
