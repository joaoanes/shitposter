defmodule ShitposterBackend.GraphQL.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :classic
  alias ShitposterBackend.GraphQL.Types.{Shitpost, User}
  alias ShitposterBackend.GraphQL.{Resolvers, Session}
  alias ShitposterBackend.GraphQL.Middlewares.{RequireAuthn, RequireBotAuthn}


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

    field :current_user, :user do
      middleware RequireAuthn
      resolve fn _, _, info ->
        {:ok, info.context.current_user}
      end
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

    @desc "Submit shitpost to categorization"
    field :add_shitpost_adv, type: :shitpost do
      middleware RequireBotAuthn
      arg :url, non_null(:string)
      arg :name, :string
      arg :initial_rating, :integer
      arg :source_id, :integer

      resolve Resolvers.run(
        &ShitposterBackend.Shitpost.create/5,
        [
          [:args, :url],
          [:args, :name],
          [:args, :initial_rating],
          [:info, :context, :current_user],
          [:args, :source_id],
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

    @desc "Create user"
    field :create_user, type: :user do
      arg :email, non_null(:string)
      arg :password, non_null(:string)
      arg :name, non_null(:string)

      resolve Resolvers.run(
        &ShitposterBackend.User.create/3,
        [
          [:args, :email],
          [:args, :password],
          [:args, :name],
        ]
      )
    end

    @desc "Login user"
    field :authenticate, type: :token do
      arg :email, non_null(:string)
      arg :password, non_null(:string)

      resolve Resolvers.run(
        &Session.create/2,
        [
          [:args, :email],
          [:args, :password],
        ]
      )
    end
  end
end
