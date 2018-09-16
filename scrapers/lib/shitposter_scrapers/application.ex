defmodule ShitposterScrapers.Application do
  use Application

  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec

    # Define workers and child supervisors to be supervised
    children = [
      # Start the Ecto repository
      supervisor(ShitposterScrapers.Repo, []),
      # Start the endpoint when the application starts
      supervisor(ShitposterScrapersWeb.Endpoint, []),
      # Start your own worker by calling: ShitposterScrapers.Worker.start_link(arg1, arg2, arg3)
      # worker(ShitposterScrapers.Worker, [arg1, arg2, arg3]),
      worker(ShitposterScrapers.Scheduler, []),
      worker(Redix, ["redis://127.0.0.1:6379", [name: :redix]]),
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ShitposterScrapers.Supervisor]

    :ok = :hackney_pool.start_pool(:long_con, [timeout: 15000, max_connections: 500])
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    ShitposterScrapersWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
