defmodule ShitposterBackend.GraphQL.Resolvers.Shitpost do
  alias ShitposterBackend.{Repo, Shitpost}
  import Ecto.Query

  def get(%{id: id}, _) do
    case (Repo.get(Shitpost, id)) do
      nil -> {:error, :not_found}
      shitpost -> {:ok, shitpost}
    end
  end

  def all(_, _) do
   case Repo.all(Shitpost) do
      res = [_, _] -> {:ok, res}
      err -> {:error, err}
    end
  end
end
