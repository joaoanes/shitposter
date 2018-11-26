defmodule ShitposterBackend.Rating do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, only: [from: 2]

  alias ShitposterBackend.Repo
  import IEx

  schema "ratings" do
    field :emoji, :string
    has_many :reactions, ShitposterBackend.Reaction
    has_many :users, through: [:reactions, :user]
    has_many :shitposts, through: [:reactions, :shitpost]
    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:emoji])
    |> validate_required([:emoji])
  end

  def first_or_create!(emoji) do
    query = from r in ShitposterBackend.Rating,
      where: r.emoji == ^emoji

    Repo.one(query) || (
      Repo.insert!(
        changeset(%ShitposterBackend.Rating{}, %{emoji: emoji})
      )
    )
  end

  def get!(id) do
    Repo.one!(Rating, id)
  end

  def all do
    {:ok, Repo.all(ShitposterBackend.Rating)}
  end
end
