# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :shitposter_scrapers,
  ecto_repos: [ShitposterScrapers.Repo]

# Configures the endpoint
config :shitposter_scrapers, ShitposterScrapersWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "AcMLfznNMLsu6a0Dd4Jw2k5JBRnY5iCd6dqIp8i6jEKnU5trobGuMx6RfyF3MGOa",
  render_errors: [view: ShitposterScrapersWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: ShitposterScrapers.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
