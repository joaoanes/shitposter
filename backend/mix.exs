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
    [mod: {ShitposterBackend.Application, []},
     extra_applications: [:logger, :runtime_tools, :absinthe, :absinthe_plug]]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_),     do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.3.0-rc"},
      {:phoenix_pubsub, "~> 1.0"},
      {:phoenix_ecto, "~> 3.2"},
      {:postgrex, ">= 0.0.0"},
      {:absinthe, "~> 1.4.9", override: true},
      {:absinthe_ecto, github: "mgwidmann/absinthe_ecto", branch: "1.4.0-beta"},
      {:absinthe_plug, "~> 1.4.2"},
      {:absinthe_relay, "~> 1.3"},
      {:absinthe_phoenix, github: "absinthe-graphql/absinthe_phoenix"},
      {:poison, "~> 3.0.0"},
      {:phoenix_html, "~> 2.6"},
      {:phoenix_live_reload, "~> 1.0", only: :dev},
      {:gettext, "~> 0.11"},
      {:cowboy, "~> 1.0"},
      {:hound, "~> 1.0"},
      {:honeydew, "~> 1.0.4"},
      {:comeonin, "~> 2.5"},
      {:guardian, "~> 1.0"},
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
     "test": ["ecto.create --quiet", "ecto.migrate", "test"]]
  end
end
