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
      [[:source]],
      nil
    )
  end

  def all(type) when is_atom(type) do
    all(type, nil)
  end

  def all(type, after_query) when is_atom(type) do
    all(
      fn -> type end,
      [],
      after_query
    )
  end


  def all(fun, arg_keys, after_query) when is_function(fun) and is_function(after_query) do
    fn source, args, info ->
      result = run_all(fun, arg_keys, source, args, info)

      {:ok, %{edges: edges}} = result

      after_query
      |> apply([Enum.map(edges, &(&1.node.id)), info])
      # TODO: HoneyDew this!

      result
    end
  end

  def all(fun, arg_keys, after_query) when is_function(fun) and is_nil(after_query) do
    fn source, args, info ->
      run_all(fun, arg_keys, source, args, info)
    end
  end

  def run_all(fun, arg_keys, source, args, info) when is_function(fun) do
    fun
      |> apply(collect_args(arg_keys, source, args, info))
      |> Junkyard.orderable(args)
      |> Connection.from_query(&Repo.all/1, args)
  end

  def run(fun, arg_keys) do
    fn source, args, info ->
      fun
      |> apply(collect_args(arg_keys, source, args, info))
    end
  end
end
