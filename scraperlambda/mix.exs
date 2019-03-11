defmodule ScraperLambda.Mixfile do
  use Mix.Project

  def project do
    [app: :scraperlambda,
     version: "0.1.0",
     elixir: "~> 1.4",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps()]
  end

  # Configuration for the OTP application
  #
  # Type "mix help compile.app" for more information
  def application do
    [
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      {:aws_lambda_elixir_runtime, "~> 0.1.0"},
      {:distillery, "~> 2.0"},
      {:httpoison, "~> 1.0"},
    ]
  end
end
