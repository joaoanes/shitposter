defmodule ShitposterScrapersWeb.Router do
  use ShitposterScrapersWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", ShitposterScrapersWeb do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
    resources "/scrapers", ScraperController do

      get "/scrape", ScraperController, :scrape, as: :scrape

    end
  end

  # Other scopes may use custom stacks.
  # scope "/api", ShitposterScrapersWeb do
  #   pipe_through :api
  # end
end
