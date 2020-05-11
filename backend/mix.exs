defmodule ShitposterBackend.Mixfile do
  use Mix.Project

  def project do
    [app: :shitposter_backend,
     version: "0.0.1",
     elixir: "~> 1.4",
     elixirc_paths: elixirc_paths(Mix.env),
     compilers: [:phoenix, :gettext] ++ Mix.compilers,
     start_permanent: Mix.env == :prod,
     aliases: aliases(),
     deps: deps()]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {ShitposterBackend.Application, []},
      extra_applications: [:logger, :runtime_tools, :absinthe, :absinthe_plug],
      included_applications: [:mnesia]
     ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_),     do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, ">= 1.3.4"},
      {:phoenix_pubsub, ">= 1.0.0", override: true},
      {:phoenix_ecto, "~> 4.0"},
      {:plug_cowboy, "~> 1.0"},
      {:postgrex, ">= 0.0.0"},
      {:absinthe_relay, "~> 1.4.3"},
      {:absinthe, "~> 1.4.3"},
      {:absinthe_ecto, ">= 0.1.3"},
      {:absinthe_plug, "~> 1.4.7"},
      {:absinthe_phoenix, ">= 1.4.0"},
      {:poison, "~> 3.0.0"},
      {:phoenix_html, "~> 2.10.5"},
      {:phoenix_live_reload, "~> 1.0", only: :dev},
      {:gettext, "~> 0.11"},
      {:cowboy, "~> 1.0"},
      {:hound, "~> 1.0"},
      {:ecto, "~> 3.0"},
      {:ecto_sql, "~> 3.0"},
      {:honeydew, "~> 1.4.5"},
      {:comeonin, "~> 2.5"},
      {:guardian, "~> 1.0"},
      {:jason, ">= 1.1.2"},
      {:corsica, "~> 1.0"},
      {:ex_aws, "~> 2.0"},
      {:ex_aws_sqs, "~> 2.0"},
      {:ex_aws_s3, "~> 2.0"},
      {:hackney, "~> 1.9"},
      {:sweet_xml, "~> 0.6"},
      {:httpoison, "~> 1.0"},
      {:file_info, "~> 0.0.1"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    ["ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
     "ecto.reset": ["ecto.drop", "ecto.setup"],
     test: ["ecto.create --quiet", "ecto.migrate", "test"]]
  end
end
