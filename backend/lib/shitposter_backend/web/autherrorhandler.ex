defmodule ShitposterBackend.AuthErrorHandler do
  import Plug.Conn

  def auth_error(conn, {type, _}, _opts) do
    body = Poison.encode!(%{message: to_string(type)})
    send_resp(conn, 401, body)
  end
end
