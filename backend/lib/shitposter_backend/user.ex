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

    has_many :reactions, ShitposterBackend.Reaction
    has_many :rated_shitposts, through: [:reactions, :shitpost]

    timestamps()
  end

  @doc false
  def create_changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:email, :password, :name])
    |> validate_required([:email, :password])
    |> put_pass_hash
  end

  def bot_changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:is_bot])
    |> validate_required([:is_bot])
    |> put_change(:is_bot, true)
  end

  def create(email, password, name) do
    create_changeset(%User{}, %{email: email, password: password, name: name})
    |> Repo.insert
  end

  def set_bot(%User{} = user) do
    bot_changeset(user, %{is_bot: true})
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
