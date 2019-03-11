defmodule Junkyard do
  require IEx

  def hello a do
    IEx.pry
    a
  end


  def ok!(conditional) do
    case conditional do
      [{:ok, res}] -> res
      {:ok, res} -> res
      {:error, err} -> (
        throw err
      )
    end
  end
  def pmap(collection, func) do
    collection
    |> Enum.map(&(Task.async(fn -> func.(&1) end)))
    |> Enum.map(&(Task.await(&1, 500_000)))

  end

end
