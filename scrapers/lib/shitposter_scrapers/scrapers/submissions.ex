§§§alias Junkyard

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
    submission_creation_changeset(attrs)
    |> Repo.insert()
  end

  def submission_creation_changeset(attrs \\ %{}) do
    %Submission{}
    |> Submission.changeset(attrs)
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

  def push_submission(%Submission{submitted_id: submitted_id} = submission) when is_integer(submitted_id) do
    submission
  end

  def push_submission(%Submission{content_url: content_url} = submission) do
    [backend_graphql_hostname: hostname] = Application.get_env(:shitposter_scrapers, ShitposterScrapers.Submissions)
    res = "#{hostname}/api/graphiql"
      |> HTTPoison.post(
        "mutation addShitpost {  addShitpost(url: \"#{content_url}\") {id}}",
        [],
        timeout: 15_000,
        recv_timeout: 15_000,
      )

    case (res) do
      {:ok, %HTTPoison.Response{body: body}} -> (
        submitted_id = body
          |> Poison.decode
          |> Junkyard.ok!
          |> Kernel.get_in(["data", "addShitpost", "id"])
          IO.inspect "Pushing #{content_url} to #{hostname} as #{submitted_id}"

        update_submission(submission, %{submitted_id: submitted_id})
          |> Junkyard.ok!

      )
      {:error, err} ->
        IO.inspect "Failed pushing #{content_url} to #{hostname}"
        submission
    end
  end

  def find_or_create(content_url) do
    query = from s in Submission,
      where: s.content_url == ^content_url

    Repo.one(query) || (
      create_submission(%{ content_url: content_url })
        |> Junkyard.ok!
    )
  end

  def find_or_create_all(custom_urls) do
    query = from s in Submission,
      where: s.content_url in ^custom_urls

    repeats = Repo.all(query, timeout: 50_000)
    new_content = custom_urls -- Enum.map(repeats, &(&1.content_url))
    |> Enum.uniq
    |> Enum.map(&(submission_creation_changeset(%{content_url: &1})))
    |> Enum.reduce(Ecto.Multi.new, fn changeset, multi ->
      if (Kernel.length(changeset.errors) != 0) do
        multi
      else
        multi
        |> Ecto.Multi.insert(changeset.changes.content_url, changeset)
      end
    end )
    |> Repo.transaction(timeout: :infinity)
    |> Junkyard.ok!
    |> Map.values

    new_content ++ repeats


  end
end
