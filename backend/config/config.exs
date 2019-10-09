# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :shitposter_backend,
  ecto_repos: [ShitposterBackend.Repo]

# Configures the endpoint
config :shitposter_backend, ShitposterBackend.Web.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "w8XvWkHgAtRmXI4U1LCIR4V8+Keyq8dRRLi0c2hFZ4g7+RWCDPUBagVNVrzKedrR",
  render_errors: [view: ShitposterBackend.Web.ErrorView, accepts: ~w(html json)],
  pubsub: [name: ShitposterBackend.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# config :ex_aws,
#   access_key_id: "MAN CAN YOU BELIEVE",
#   secret_access_key: "I USED TO HAVE PLAINTEXT SECRETS HERE",
#   s3: [
#    scheme: "INSTEAD OF USING IAM PROFILES",
#    region: "LIKE A SANE OR LESS INSANE MAN"
#   ],

config :ex_aws,
  region: "eu-central-1"

config :shitposter_backend, ShitposterBackend.Guardian,
  issuer: "ShitposterBackend",
  ttl: { 360, :days },
  verify_issuer: true,
  secret_key: "Q/rwhg80j43qw8hf8i0wehi0thqwipahgtuesiphg90wrgt"

config :hound, driver: "chrome_driver", browser: "chrome_headless"

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
