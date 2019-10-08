defmodule ShitposterBackend.Application do
  use Application
  alias ShitposterBackend.Workers.{Categorizer, Uploader, QueueFetcher}

  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec

    # Define workers and child supervisors to be supervised
    children = [
      # Start the Ecto repository
      supervisor(ShitposterBackend.Repo, []),
      # Start the endpoint when the application starts
      supervisor(ShitposterBackend.Web.Endpoint, []),
      supervisor(Absinthe.Subscription, [ShitposterBackend.Web.Endpoint]),
      Honeydew.queue_spec(:categorizer),
      Honeydew.worker_spec(:categorizer, {Categorizer, []}, num: 15, init_retry_secs: 10),
      Honeydew.queue_spec(:uploader),
      Honeydew.worker_spec(:uploader, {Uploader, []}, num: 15, init_retry_secs: 10),
      Honeydew.queue_spec(:queue_fetcher),
      Honeydew.worker_spec(:queue_fetcher, {QueueFetcher, []}, num: 15, init_retry_secs: 10)
      # Start your own worker by calling: ShitposterBackend.Worker.start_link(arg1, arg2, arg3)
      # worker(ShitposterBackend.Worker, [arg1, arg2, arg3]),
    ]

    # See http://elixir-lang.org/docs/stable/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ShitposterBackend.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
