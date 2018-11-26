defmodule ShitposterBackend.Workers.Uploader do
  @moduledoc """
    This is an example Worker to interface with Riak.
    You'll need to add the erlang riak driver to your mix.exs:
    `{:riakc, ">= 2.4.1}`
  """

  use Hound.Helpers
  alias ShitposterBackend.Shitpost
  alias ExAws.S3

  import IEx

  @behaviour Honeydew.Worker

  def init(_) do
    {:ok, %{}}
  end

  def host_permalink(%Shitpost{url: url} = shitpost, _state) do
    # https://github.com/edgurgel/httpoison/issues/93

    case HTTPoison.get(url, [], hackney: [:insecure]) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        name = "#{Base.encode16(:crypto.hash(:md5, url))}"
        path = "/tmp/#{name}"
        File.write!(path, body)
        %{^path => fileInfo} = FileInfo.get_info(path)

        %{status_code: 200} = S3.put_object(
          "shitposter-content",
          "content/#{name}",
          body,
          content_type: "#{fileInfo.type}/#{fileInfo.subtype}"
        )
        |> ExAws.request!

        Shitpost.set_permalink(
          shitpost,
          "https://s3.eu-central-1.amazonaws.com/shitposter-content/content/#{name}"
        )
      {:ok, %HTTPoison.Response{status_code: status_code}} ->
        {:error, [url: "server responded with #{status_code}"]}
      {:error, %HTTPoison.Error{reason: _}} ->
        {:error, :we_have_no_idea_what_went_wrong}
    end
  end
end
