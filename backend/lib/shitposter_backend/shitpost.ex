defmodule ShitposterBackend.Shitpost do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias ShitposterBackend.{Shitpost, User, Rating, Reaction, Source}
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

    timestamps()
  end

  @threshold 1

  @doc false
  def changeset(%Shitpost{} = shitpost, attrs) do
    shitpost
    |> cast(attrs, [:url, :type, :name, :url_date, :source_id, :submitter_id, :source_link, :permalink])
    |> cast_assoc(:reactions)
    |> foreign_key_constraint(:submitter_id)
    |> foreign_key_constraint(:source_id)
    |> validate_required([:url, :type])
  end

  def create(url, name) do
    create(url, name, nil, nil, nil, nil, nil)
  end

  def create(url, name, %User{id: submitter_id}, source_id, rating_ids, url_date, source_link) do
    create(url, name, submitter_id, source_id, rating_ids, url_date, source_link)
  end

  def create(url, name, submitter_id, source_id, rating_ids, url_date, source_link) do
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

            shitpost
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

  def rate(id, %User{id: id}, rating_id) do
    rate(id, id, rating_id)
  end

  def rate(id, rater_id, rating_id) do
    shitpost = Repo.get!(Shitpost, id) |> Repo.preload(:reactions)
    rating = Repo.get!(Rating, rating_id)

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

        case ratings_count >= @threshold do
          true -> host_permalink(updated_shitpost)
          false -> {:ok, updated_shitpost}
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
end
