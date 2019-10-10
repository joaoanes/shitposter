defmodule ShitposterBackend.Workers.QueueFetcher do
  require Logger
  import Ecto.Query

  use Hound.Helpers

  @behaviour Honeydew.Worker

  def init(_) do
    {:ok, %{worker_user: ShitposterBackend.User |> where(email: "pixies@shitpost.network") |> ShitposterBackend.Repo.one}}
  end

  def consume(%{worker_user: user}) do
    {:ok, %{body: %{messages: messages}}} =
      ExAws.SQS.receive_message("scraper-upload-queue.fifo", [max_number_of_messages: 10]) |> ExAws.request(region: "eu-central-1")

    new_shitposts = Enum.map(messages, fn message ->
      %{body: bod} = message
      {:ok, [url, meta]} = Poison.decode(bod)

      %{"postedAt" => posted_at, "sourceLink" => source_link, "hashtags" => hashtags} = meta

      case ShitposterBackend.Shitpost.create(url, nil, user, nil, [], posted_at, source_link, hashtags) do
        {:ok, shitpost} -> (
          ExAws.SQS.delete_message("scraper-upload-queue.fifo", message.receipt_handle)
          |> ExAws.request(region: "eu-central-1")

          shitpost.id
        )
        _ -> nil
      end
    end
    )

    new_shitposts
  end
end
