defmodule ShitposterBackend.User do
  use Ecto.Schema
  import Ecto.Changeset
  alias ShitposterBackend.{User, Repo}


  schema "users" do
    field :email, :string
    field :name, :string
    field :password, :string, virtual: true
    field :password_hash, :string
    field :is_bot, :boolean
    field :is_curator, :boolean

    has_many :reactions, ShitposterBackend.Reaction
    has_many :rated_shitposts, through: [:reactions, :shitpost]

    timestamps()
  end

  @doc false
  def create_changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:email, :password, :name])
    |> validate_required([:email])
    |> put_pass_hash
  end

  def create(email, password, name) do
    create(email, password, name, nil, nil)
  end

  def create(email, password, name, is_bot, is_curator) do
    create_changeset(%User{}, %{email: email, password: password, name: name, is_bot: is_bot, is_curator: is_curator})
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

  defp put_pass_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
        put_change(changeset, :password_hash, Comeonin.Bcrypt.hashpwsalt(pass))
      _ ->
        changeset
    end
  end
end
