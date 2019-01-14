use Mix.Config

# In this file, we keep production configuration that
# you likely want to automate and keep it away from
# your version control system.
#
# You should document the content of this
# file or create a script for recreating it, since it's
# kept out of version control and might be hard to recover
# or recreate for your teammates (or you later on).
config :shitposter_backend, ShitposterBackend.Web.Endpoint,
  secret_key_base: "o8T0oRgPYfpM7p/JxVRR9lBTBAnmrzzXm2zGWJJXrV/X23VQpITU2EDB+EK7Eabp"

# Configure your database
config :shitposter_backend, ShitposterBackend.Repo,
  adapter: Ecto.Adapters.Postgres,
  database: "shitposter_production",
  pool_size: 15
