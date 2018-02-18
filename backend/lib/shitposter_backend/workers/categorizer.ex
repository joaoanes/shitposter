defmodule ShitposterBackend.Workers.Categorizer do
  @moduledoc """
    This is an example Worker to interface with Riak.
    You'll need to add the erlang riak driver to your mix.exs:
    `{:riakc, ">= 2.4.1}`
  """

  defmodule Scraper do

    def takeScreenshot(url) do
      {_res, 0} = System.cmd("node", ["./lib/shitposter_backend/workers/scraper/webScraper.js", url])
      IO.puts "Woop, url added"
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
      {:ok, type} -> type
      nil -> (
        Scraper.takeScreenshot(url)
        "webpage"
      )
    end

  end


  def is_tweet(url) do
    case Regex.match?(~r/https*:\/\/[mobile.]*twitter.com\/.+\/status\/.+/, url) do
      false -> nil
      _ -> {:ok, "tweet"}
    end
  end

  def is_image(url) do
    matches = ~r/\.([0-9a-z]+)(?:[\?#]|$)/
    |> Regex.run(url) || []

    case List.last(matches) do
      "png" -> {:ok, "image"}
      "jpg" -> {:ok, "image"}
      "jpeg" -> {:ok, "image"}
      _ -> nil
    end
  end
end
