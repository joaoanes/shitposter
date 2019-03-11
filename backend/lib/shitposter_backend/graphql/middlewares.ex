defmodule ShitposterBackend.GraphQL.Middlewares do

  alias ShitposterBackend.{User, Guardian}

  defmodule RequireAuthn do
    @behaviour Absinthe.Middleware

    def call(%{context: %{current_user: %User{}}} = resolution, _config) do
      resolution
    end

    def call(%{context: %{current_user: nil}} = resolution, _config) do
      resolution
      |> Absinthe.Resolution.put_result({:error, %{
        message: "using this field requires authentication",
      }})
    end
  end

  defmodule RequireBotAuthn do
    @behaviour Absinthe.Middleware

    def call(%{context: %{current_user: %User{is_bot: true}}} = resolution, _config) do
      resolution
    end

    def call(%{context: %{current_user: _}} = resolution, _config) do
      resolution
      |> Absinthe.Resolution.put_result({:error, %{
        message: "using this field requires bot credentials",
      }})
    end
  end

  defmodule Context do
    @behaviour Plug
    import Plug.Conn

    def init(opts), do: opts

    def call(conn, _opts) do
      conn
      |> put_private(
        :absinthe,
        %{context:
          %{
            current_user: Guardian.Plug.current_resource(conn),
          },
        }
      )
    end
  end

end
