defmodule ShitposterBackend.GraphQL.Session do
  alias ShitposterBackend.{Repo, User, Guardian}

  def create(name) do
    Repo.get_by(User, name: name)
    |> create_token
  end

  defp create_token(user) do
    case Guardian.encode_and_sign(user) do
      {:error, _} -> {:error, "An Error occured creating the token"}
      {:ok, token, _full_claims} -> {:ok, %{token: token}}
    end
  end
end
