defmodule ShitposterBackend.GraphQL.Types.User do
  use Absinthe.Schema.Notation
  use Absinthe.Ecto, repo: ShitposterBackend.Repo

  @desc "User"
  object :user do
    field :id, :id
    field :email, :string
    field :name, :string
  end

  @desc "User token"
  object :token do
    field :token, :string
  end

end
