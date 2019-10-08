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
      ExAws.SQS.receive_message("scraper-upload-queue.fifo") |> ExAws.request(region: "eu-central-1")

    Enum.map(messages, fn %{body: bod} ->
      {:ok, [url, meta]} = Poison.decode(bod)

      %{"postedAt" => posted_at, "sourceLink" => source_link} = meta

      ShitposterBackend.Shitpost.create(url, nil, user, nil, [], posted_at, source_link)
    end
    )

    ExAws.SQS.delete_message_batch("scraper-upload-queue.fifo", Enum.map(messages, fn %{message_id: mid, receipt_handle: rec} ->
      %{id: mid, receipt_handle: rec}
    end))
  end
end
