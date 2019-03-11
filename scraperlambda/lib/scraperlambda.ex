defmodule ScraperLambda do

  require Logger

  @spec hello_world(Map.t(), Map.t()) :: Term
  def hello_world(%{:thread_id => thread_id} = request, context) when is_map(request) and is_map(context) do
    LMAOScraper.fetch_thread(thread_id)

    :ok
  end

  def hello_world(_) do

    :bad_request
  end
end
