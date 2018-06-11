defmodule ShitposterScrapers.Submissions do
  @moduledoc """
  The Scrapers context.
  """

  import Ecto.Query, warn: false
  alias ShitposterScrapers.Repo

  alias ShitposterScrapers.Submission

  import IEx

  @doc """
  Returns the list of submissions.

  ## Examples

      iex> list_submissions()
      [%Submission{}, ...]

  """
  def list_submissions do
    Repo.all(Submission)
  end

  @doc """
  Gets a single submission.

  Raises `Ecto.NoResultsError` if the Submission does not exist.

  ## Examples

      iex> get_submission!(123)
      %Submission{}

      iex> get_submission!(456)
      ** (Ecto.NoResultsError)

  """
  def get_submission!(id), do: Repo.get!(Submission, id)

  @doc """
  Creates a submission.

  ## Examples

      iex> create_submission(%{field: value})
      {:ok, %Submission{}}

      iex> create_submission(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_submission(attrs \\ %{}) do
    %Submission{}
    |> Submission.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a submission.

  ## Examples

      iex> update_submission(submission, %{field: new_value})
      {:ok, %Submission{}}

      iex> update_submission(submission, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_submission(%Submission{} = submission, attrs) do
    submission
    |> Submission.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Submission.

  ## Examples

      iex> delete_submission(submission)
      {:ok, %Submission{}}

      iex> delete_submission(submission)
      {:error, %Ecto.Changeset{}}

  """
  def delete_submission(%Submission{} = submission) do
    Repo.delete(submission)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking submission changes.

  ## Examples

      iex> change_submission(submission)
      %Ecto.Changeset{source: %Submission{}}

  """
  def change_submission(%Submission{} = submission) do
    Submission.changeset(submission, %{})
  end

  def find_by_content([_ | _] = content) do
    query = from s in Submission,
      where: s.content_url in ^content

    Repo.all(query)
  end

  def find_by_content([]) do
    []
  end

  def find_by_content(content) do
    query = from s in Submission,
      where: s.content_url == ^content

    Repo.one(query)
  end

  def push_submission(%Submission{content_url: content_url} = submission) do
    res = "localhost:4000/api/graphiql"
      |> HTTPoison.post(
        "mutation addShitpost {  addShitpost(url: \"#{content_url}\") {id}}"
      )

    case (res) do
      {:ok, %HTTPoison.Response{body: body}} -> (
        body
        |> Poison.decode
        |> ok!
        |> IO.inspect
      )
      {:error, err} -> err
    end
  end

  def remove_saved(posts) do

    posts_with_content = Enum.filter(
      posts,
      fn post -> post[:extracted] != nil end
    )
    content_urls = Enum.map(posts_with_content, &(Map.get(&1, :extracted, nil)))

    repeated_content = content_urls
      |> find_by_content
      |> Enum.filter(&(&1 != nil))
      |> Enum.map(&(&1.content_url))

    Enum.filter(
      posts_with_content,
      fn post -> !Enum.member?(repeated_content, post[:extracted])  end
    )
  end


  def ok!(conditional) do
    case conditional do
      {:ok, res} -> res
      {:error, err} -> (
        throw err
      )
    end
  end

end
