defmodule ShitposterBackend.Hashtag do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, only: [from: 2]

  alias ShitposterBackend.{Repo, Shitpost}

  schema "hashtags" do
    field :name, :string
    many_to_many :shitposts, Shitpost, join_through: "hashtags_shitposts"

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name])
    |> validate_required([:name])
  end

  def first_or_create!(name) do
    query = from r in ShitposterBackend.Hashtag,
      where: r.name == ^name

    Repo.one(query) || (
      Repo.insert!(
        changeset(%ShitposterBackend.Hashtag{}, %{name: name})
      )
    )
  end

  def get!(id) do
    query = from r in ShitposterBackend.Hashtag,
      where: r.id == ^id

    Repo.one!(query)
  end

  def all do
    {:ok, Repo.all(ShitposterBackend.Hashtag)}
  end
end
