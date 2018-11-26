defmodule ShitposterBackend.Reaction do
  use Ecto.Schema
  import Ecto.Changeset

  schema "reactions" do
    belongs_to :shitpost, ShitposterBackend.Shitpost
    belongs_to :rating, ShitposterBackend.Rating
    belongs_to :user, ShitposterBackend.User
    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:rating_id, :shitpost_id, :user_id])
    |> validate_required([:rating_id, :shitpost_id, :user_id])
  end
end
