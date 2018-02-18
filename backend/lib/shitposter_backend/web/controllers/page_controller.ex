defmodule ShitposterBackend.Web.PageController do
  use ShitposterBackend.Web, :controller

  def index(conn, _params) do
    conn
    |> html(File.read!("./priv/static/index.html"))
  end
end
