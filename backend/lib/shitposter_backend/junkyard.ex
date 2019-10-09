defmodule ShitposterBackend.Junkyard do
  @moduledoc """
  JUNK! helper functions

  """

  def ok!(conditional) do
    case conditional do
      [{:ok, res}] -> res
      {:ok, res} -> res
      {:error, err} -> (
        raise err
      )
    end
  end
  def pmap(collection, func) do
    collection
    |> Enum.map(&(Task.async(fn -> func.(&1) end)))
    |> Enum.map(&(Task.await(&1, 500_000)))

  end

  def handle_changeset_errors(%{errors: errors}) do
    Enum.map(errors, fn {field, detail} ->
      "#{field} " <> render_detail(detail)
    end)
      |> Enum.join
  end

  def render_detail({message, values}) do
    Enum.reduce values, message, fn {k, v}, acc ->
      String.replace(acc, "%{#{k}}", to_string(v))
    end
  end

  def render_detail(message) do
    message
  end

end
