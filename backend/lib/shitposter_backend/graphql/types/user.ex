defmodule ShitposterBackend.GraphQL.Types.User do
  use Absinthe.Schema.Notation
  use Absinthe.Ecto, repo: ShitposterBackend.Repo

  @desc "User"
  object :user do
    field :id, :id
    field :email, :string
    field :name, :string
  end

end
