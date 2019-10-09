defmodule ShitposterBackend.Web.Router do
  use ShitposterBackend.Web, :router
  alias ShitposterBackend.Web.PageController

  pipeline :browser do
    plug :accepts, ["html"]
  end

  pipeline :api do
    plug :accepts, ["json", "graphql"]
    plug Guardian.Plug.VerifyHeader, realm: "Bearer"
    plug Guardian.Plug.LoadResource, allow_blank: true
    plug ShitposterBackend.GraphQL.Middlewares.Context
  end

  scope "/" do
    pipe_through :browser # Use the default browser stack
    get "/", PageController, :index
    get "/graphiql", Absinthe.Plug.GraphiQL, schema: ShitposterBackend.GraphQL.Schema

  end

  scope "/api" do
    pipe_through :api
    forward "/graphiql", Absinthe.Plug.GraphiQL, schema: ShitposterBackend.GraphQL.Schema
  end

  # Other scopes may use custom stacks.
end
