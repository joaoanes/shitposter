defmodule ShitposterBackend.Web.Router do
  use ShitposterBackend.Web, :router
  alias ShitposterBackend.Web.PageController

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

  scope "/" do
    pipe_through :browser # Use the default browser stack
    get "/", PageController, :index
    get "/graphiql", Absinthe.Plug.GraphiQL, schema: ShitposterBackend.GraphQL.Schema

  end

  scope "/api" do
    post "/graphiql", Absinthe.Plug.GraphiQL, schema: ShitposterBackend.GraphQL.Schema
  end

  # Other scopes may use custom stacks.
end
