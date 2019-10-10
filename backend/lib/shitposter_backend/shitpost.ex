defmodule ShitposterBackend.Shitpost do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias ShitposterBackend.{Shitpost, User, Rating, Reaction, Source, Hashtag}
  alias ShitposterBackend.Repo
  require Logger

  schema "shitposts" do
    field :url, :string
    field :permalink, :string
    field :name, :string
    field :source_link, :string
    field :type, :string #actually an enum!
    field :url_date, :utc_datetime
    belongs_to :source, Source
    belongs_to :submitter, User
    has_many :reactions, Reaction, foreign_key: :shitpost_id
    many_to_many :ratings, Rating, join_through: "reactions"
    many_to_many :hashtags, Hashtag, join_through: "hashtags_shitposts"
    many_to_many :users, User, join_through: "seen_shitposts"

    timestamps()
  end

  @threshold 10

  @doc false
  def changeset(%Shitpost{} = shitpost, attrs) do
    shitpost
    |> cast(attrs, [:url, :type, :name, :url_date, :source_id, :submitter_id, :source_link, :permalink])
    |> cast_assoc(:reactions)
    |> cast_assoc(:hashtags)
    |> foreign_key_constraint(:submitter_id)
    |> foreign_key_constraint(:source_id)
    |> validate_required([:url, :type])
  end

  @spec create(any, any) :: any
  def create(url, name) do
    create(url, name, nil, nil, nil, nil, nil, nil)
  end

  def create(url, name, %User{id: submitter_id}, source_id, rating_ids, url_date, source_link, hashtags) do
    create(url, name, submitter_id, source_id, rating_ids, url_date, source_link, hashtags)
  end

  def create(url, name, submitter_id, source_id, rating_ids, url_date, source_link, hashtags) do
    categorizerOutput = {:categorize, [url]}
    |> Honeydew.async(:categorizer, reply: true)
    |> Honeydew.yield(15000)

    case categorizerOutput do
      {:ok, [type, fixed_url]} -> Repo.transaction fn -> (
        changeset = Shitpost.changeset(
          %Shitpost{},
          %{
            url: fixed_url,
            type: type,
            name: name,
            source_id: source_id,
            submitter_id: submitter_id,
            url_date: url_date,
            source_link: source_link,
          }
        )

        shitpost = Repo.insert(
          changeset
        )
        |> ShitposterBackend.Junkyard.ok!

        case rating_ids do
          nil -> shitpost
          _ -> (
            rating_ids
            |> Enum.map(fn (%{rating_id: rating_id}) ->

              rating_object = Rating.get!(rating_id)
              Ecto.build_assoc(shitpost, :reactions, %{rating_id: rating_object.id})
              |> Repo.insert
            end)
          )
        end

        case hashtags do
          nil -> shitpost
          _ -> (
            hashtag_objects = Enum.map(hashtags, fn (hashtag) ->
              Hashtag.first_or_create!(hashtag)
            end)

            shitpost
            |> Repo.preload(:hashtags)
            |> Ecto.Changeset.change
            |> Ecto.Changeset.put_assoc(:hashtags, hashtag_objects)
            |> Repo.update!
          )
        end

      )
      end
      _ -> {:error, ["oops"]}
    end
  end

  def count_ratings(id) do
    ratings = Repo.all(
      from reaction in Reaction,
        join: rating in assoc(reaction, :rating),
        where: rating.id == reaction.rating_id,
        where: reaction.shitpost_id == ^id,
        group_by: rating.id,
        select: {
          rating.emoji,
          count(rating.id)
        }
    )
    |> Enum.map(fn {emoji, count} ->
      %{
        emoji: emoji,
        count: count
      }
    end)

    {:ok, ratings}
  end

  def rate(id, %User{id: user_id}, rating_id) do
    rate(id, user_id, rating_id)
  end

  def rate(id, rater_id, rating_id) do
    shitpost = Repo.get!(Shitpost, id) |> Repo.preload(:reactions)
    rating = Repo.get!(Rating, rating_id)
    rater = if rater_id do Repo.get(User, rater_id) else nil end

    Ecto.build_assoc(shitpost, :reactions, %{user_id: rater_id, rating_id: rating.id})
    |> Repo.insert!

    updated_shitpost = Repo.get!(Shitpost, shitpost.id) |> Repo.preload(:reactions)

    case is_nil(updated_shitpost.permalink) do
      false -> {:ok, updated_shitpost}
      true ->
        [{ratings_count}] = Repo.all(
          from reaction in Reaction,
            where: reaction.shitpost_id == ^id,
            select: {
              count(reaction.shitpost_id)
            }
        )

        case ratings_count >= @threshold || (rater_id != nil && rater.is_curator) do
          true -> host_permalink(updated_shitpost)
          _ -> {:ok, updated_shitpost}
        end
    end
  end

  defp host_permalink(%Shitpost{type: "webpage"} = shitpost) do
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{type: "youtube"} = shitpost) do
    #TODO: youtube-dl support?
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{type: "tweet"} = shitpost) do
    #TODO: archive.org support?
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{type: "amp"} = shitpost) do
    #TODO: uhhhh
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{type: "medium_post"} = shitpost) do
    #TODO uuhhhhhhhhhhh
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{type: "facebook_post"} = shitpost) do
    #TODO UUUUUHHHHHHHHHHHH
    {:ok, shitpost}
  end

  defp host_permalink(%Shitpost{url: _} = shitpost) do
    {:ok, updatedShitpost} = {:host_permalink, [shitpost]}
    |> Honeydew.async(:uploader, reply: true)
    |> Honeydew.yield
    updatedShitpost
  end

  def set_permalink(%Shitpost{permalink: p} = shitpost, permalink) when is_nil(p) do
    shitpost
    |> changeset(%{permalink: permalink})
    |> Repo.update
  end

  def set_permalink(%Shitpost{id: id} = permalinked_shitpost, _) do
    Logger.warn {"why are we permalinking multiple times?", [id: id]}
    {:ok, permalinked_shitpost}
  end

  def set_seen(_ , %{context: %{current_user: user}}) when is_nil(user) do
  end

  def set_seen(ids, %{context: %{current_user: user}}) do
    ids
    |> Enum.map(fn id -> ShitposterBackend.SeenShitpost.create(user.id, id) end)
  end
end
