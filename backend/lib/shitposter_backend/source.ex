defmodule ShitposterBackend.Source do
  use Ecto.Schema
  import Ecto.Changeset
  alias ShitposterBackend.Source


  schema "sources" do
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(%Source{} = source, attrs) do
    source
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end
end
