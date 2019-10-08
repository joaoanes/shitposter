defmodule ShitposterBackend.Workers.Categorizer do
  require Logger

  defmodule Scraper do
    def takeScreenshot(url) do
      {_res, 0} = System.cmd("node", ["./lib/shitposter_backend/workers/scraper/webScraper.js", url])
      Logger.log(:info, "Added screenshot for url #{url}")
      url
    end
  end

  use Hound.Helpers

  @behaviour Honeydew.Worker

  def init(_) do
    {:ok, %{}}
  end

  def categorize(url, _state) do
    type = ShitposterBackend.Workers.Categorizer.__info__(:functions) -- [init: 1, categorize: 2]
    |> Enum.map(
      fn {functionAtom, _arity} ->
        Kernel.apply(ShitposterBackend.Workers.Categorizer, functionAtom, [url])
      end
    )
    |> Enum.filter(fn x -> x end)
    |> List.first

    case type do
      {:ok, ["tweet", url]} -> (
        Scraper.takeScreenshot(url)
        ["tweet", url]
      )
      {:ok, [type, url]} -> [type, url]
      nil -> (
        Scraper.takeScreenshot(url)
        ["webpage", url]
      )
    end

  end

  def is_youtube(url) do
    matches = ~r/(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/ |> Regex.run(url) || []

    case length(matches) do
      0 -> nil
      _ -> (
        [_, vidCode] = matches
        {:ok, ["youtube", "https://www.youtube.com/watch?v=#{vidCode}"]}
      )
    end
  end

  def is_video(url) do
    matches = ~r/\.([0-9a-z]+)(?:[\?#]|$)/
    |> Regex.run(url) || []

    case List.last(matches) do
      "webm" -> {:ok, ["video", url]}
      "mp4" -> {:ok, ["video", url]}
      "avi" -> {:ok, ["video", url]}
      "mov" -> {:ok, ["video", url]}
      _ -> nil
    end
  end


  def is_tweet(url) do
    matches = ~r/(?:http(?:s*):\/\/)?(?:www\.)?(?:mobile\.)?twitter\.com\/(.*)\/status\/*([\w\-]*)/ |> Regex.run(url) || []

    case length(matches) do
      3 -> (
        [_, username, tweet_id] = matches
        {:ok, ["tweet", "https://twitter.com/#{username}/status/#{tweet_id}"]}
      )
      _ -> nil
    end
  end

  def is_image(url) do
    matches = ~r/\.([0-9a-z]+)(?:[\?#]|$)/
    |> Regex.run(url) || []

    case List.last(matches) do
      "gif" -> {:ok, ["image", url]}
      "png" -> {:ok, ["image", url]}
      "jpg" -> {:ok, ["image", url]}
      "jpeg" -> {:ok, ["image", url]}
      _ -> nil
    end
  end
end
