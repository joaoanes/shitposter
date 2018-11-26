defmodule ShitposterBackend.GraphQL.Resolvers do

  alias Absinthe.Relay.Connection

  alias ShitposterBackend.GraphQL.Resolvers.Junkyard

  alias ShitposterBackend.Repo

  def by_id(type) when is_atom(type) do
    fn %{id: id}, _info ->
      {:ok, type |> Repo.get(id)}
    end
  end

  defp collect_args(arg_keys, source, args, info) do
    source_struct = case Map.has_key?(source, :__struct__) do
      true -> Map.from_struct(source)
      false -> source
    end

    ctx = %{source: source_struct, args: args, info: Map.from_struct(info)}

    Enum.map(arg_keys, &safe_get_in(ctx, &1))
  end

  def safe_get_in(map, key) do
    try do
      get_in(map, key)
    rescue
      BadMapError -> nil
    end
  end

  def assoc(assocs) do
    all(
      fn source ->
        Ecto.assoc(source, assocs)
      end,
      [[:source]]
    )
  end

  def all(type) when is_atom(type) do
    all(
      fn -> type end,
      []
    )
  end

  def all(fun, arg_keys) when is_function(fun) do
    fn source, args, info ->
      result = fun
      |> apply(collect_args(arg_keys, source, args, info))
      |> Junkyard.orderable(args)
      |> Connection.from_query(&Repo.all/1, args)

      result
    end
  end

  def run(fun, arg_keys) do
    fn source, args, info ->
      fun
      |> apply(collect_args(arg_keys, source, args, info))
    end
  end

end
