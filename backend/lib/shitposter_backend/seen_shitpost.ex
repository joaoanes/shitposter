defmodule ShitposterBackend.SeenShitpost do
  use Ecto.Schema
  import Ecto.Changeset

  alias ShitposterBackend.{Repo, SeenShitpost}

  schema "seen_shitposts" do
    field :user_id, :id
    field :shitpost_id, :id

    timestamps()
  end

  @doc false
  def changeset(seen_shitpost, attrs) do
    seen_shitpost
    |> cast(attrs, [:user_id, :shitpost_id])
    |> validate_required([:user_id, :shitpost_id])
  end

  def create(user_id, shitpost_id) do
    changeset(
      %SeenShitpost{},
      %{
        user_id: user_id,
        shitpost_id: shitpost_id,
      }
    )
    |> Repo.insert
    |> ShitposterBackend.Junkyard.ok!
  end
end
