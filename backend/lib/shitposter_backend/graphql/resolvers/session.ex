defmodule ShitposterBackend.GraphQL.Session do
  alias ShitposterBackend.{Repo, User, Guardian}

  def create(email, password) do
    user = Repo.get_by(User, email: email)

    case authenticate(user, password) do
      true -> create_token(user)
      _    -> {:error, "User could not be authenticated."}
    end
  end

  defp authenticate(%User{password_hash: ph} = user, password) do
    case user do
      nil -> false
      _   -> Comeonin.Bcrypt.checkpw(password, ph)
    end
  end

  defp authenticate(_, _) do
    false
  end

  defp create_token(user) do
    case Guardian.encode_and_sign(user) do
      nil -> {:error, "An Error occured creating the token"}
      {:ok, token, _full_claims} -> {:ok, %{token: token}}
    end
  end
end
