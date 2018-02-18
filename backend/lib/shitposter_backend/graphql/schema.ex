defmodule ShitposterBackend.GraphQL.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema
  alias ShitposterBackend.GraphQL.Types.{Shitpost, User}
  alias ShitposterBackend.GraphQL.Resolvers

  import_types Shitpost
  import_types User



  query do
    field :shitpost, :shitpost do
      arg :id, type: non_null(:id)
      resolve Resolvers.by_id(ShitposterBackend.Shitpost)
    end

    connection field :shitposts, node_type: :shitpost do
      arg :order_by, type: :string, default_value: "id"
      resolve Resolvers.all(ShitposterBackend.Shitpost)
    end
  end

  mutation do
    @desc "Submit shitpost to categorization"
    field :add_shitpost, type: :shitpost do
      arg :url, non_null(:string)
      arg :name, :string

      resolve Resolvers.run(
        &ShitposterBackend.Shitpost.create/2,
        [
          [:args, :url],
          [:args, :name],
        ]
      )
    end

    @desc "Rate shitpost"
    field :rate_shitpost, type: :shitpost do
      arg :id, non_null(:id)

      resolve Resolvers.run(
        &ShitposterBackend.Shitpost.rate/1,
        [
          [:args, :id],
        ]
      )
    end
  end
end
