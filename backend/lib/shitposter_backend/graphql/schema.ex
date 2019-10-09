defmodule ShitposterBackend.GraphQL.Schema do
  use Absinthe.Schema
  use Absinthe.Relay.Schema, :classic
  alias ShitposterBackend.GraphQL.Resolvers
  alias ShitposterBackend.GraphQL.Types.{Shitpost, User}
  alias ShitposterBackend.GraphQL.{Resolvers, Session}
  alias ShitposterBackend.GraphQL.Middlewares.{RequireAuthn, RequireBotAuthn, RequireAuthenticatorAuthn}

  import_types Shitpost
  import_types User

  query do
    field :shitpost, :shitpost do
      arg :id, type: non_null(:id)
      resolve Resolvers.by_id(ShitposterBackend.Shitpost)
    end

    field :ratings, list_of(:rating) do
      resolve Resolvers.run(
        &ShitposterBackend.Rating.all/0,
        []
      )
    end

    connection field :shitposts, node_type: :shitpost do
      arg :order_by, type: :string, default_value: "id"
      arg :types, type: list_of(:shitpost_type), default_value: nil
      arg :direction, type: :string, default_value: "desc"
      resolve Resolvers.all(ShitposterBackend.Shitpost, &ShitposterBackend.Shitpost.set_seen/2)
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
      arg :url_date, :string
      arg :name, :string
      arg :reactions, list_of(:reaction_input)
      arg :source_id, :integer
      arg :source_link, :string
      arg :hashtags, list_of(:string)

      resolve Resolvers.run(
        &ShitposterBackend.Shitpost.create/8,
        [
          [:args, :url],
          [:args, :name],
          [:info, :context, :current_user],
          [:args, :source_id],
          [:args, :reactions],
          [:args, :url_date],
          [:args, :source_link],
          [:args, :hashtags],
        ]
      )
    end

    @desc "Rate shitpost"
    field :rate_shitpost, type: :shitpost do
      arg :id, non_null(:id)
      arg :rating_id, non_null(:id)

      resolve Resolvers.run(
        &ShitposterBackend.Shitpost.rate/3,
        [
          [:args, :id],
          [:info, :context, :current_user, Access.key(:id)],
          [:args, :rating_id],
        ]
      )
    end

    @desc "Create curator"
    field :create_curator, type: :user do
      middleware RequireAuthenticatorAuthn
      arg :name, non_null(:string)

      resolve Resolvers.run(
        &ShitposterBackend.User.create_curator/1,
        [
          [:args, :name],
        ]
      )
    end

    @desc "Create user"
    field :create_user, type: :user do
      arg :email, :string
      arg :name, non_null(:string)

      resolve Resolvers.run(
        &ShitposterBackend.User.create/2,
        [
          [:args, :email],
          [:args, :name],
        ]
      )
    end

    @desc "Login user"
    field :authenticate, type: :token do
      middleware RequireAuthenticatorAuthn
      arg :name, non_null(:string)

      resolve Resolvers.run(
        &Session.create/1,
        [
          [:args, :name],
        ]
      )
    end
  end
end
