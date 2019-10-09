defmodule ShitposterBackend.User do
  use Ecto.Schema
  import Ecto.Changeset
  alias ShitposterBackend.{User, Repo, Reaction, Shitpost}


  schema "users" do
    field :name, :string
    field :email, :string
    field :is_bot, :boolean
    field :is_curator, :boolean
    field :is_authenticator, :boolean

    has_many :reactions, Reaction
    has_many :rated_shitposts, through: [:reactions, :shitpost]
    many_to_many :seen_shitposts, Shitpost, join_through: "seen_shitposts"

    timestamps()
  end

  @doc false
  def create_changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:email, :name])
    |> validate_required([:name])
    |> unique_constraint(:name)
  end

  def create(email, name) do
    create(email, name, nil, nil, nil)
  end

  def create(name) do
    create(nil, name, nil, nil, nil)
  end


  def create_curator(name) do
    {:ok, user} = create(nil, name, nil, nil, nil)
    user
    |> Ecto.Changeset.change(is_curator: true)
    |> Repo.update
  end

  @spec create(any, any, any, any, any) :: any
  def create(email, name, is_bot, is_curator, is_authenticator) do
    create_changeset(
      %User{},
      %{
        email: email,
        name: name,
        is_bot: is_bot,
        is_curator: is_curator,
        is_authenticator: is_authenticator
      }
    )
    |> Repo.insert
  end

  def set_bot(%User{} = user) do
    user
    |> Ecto.Changeset.change(is_bot: true)
    |> Repo.update
  end

  def set_curator(%User{} = user) do
    user
    |> Ecto.Changeset.change(is_curator: true)
    |> Repo.update
  end

  # let's just not allow people to create authenticators
end
