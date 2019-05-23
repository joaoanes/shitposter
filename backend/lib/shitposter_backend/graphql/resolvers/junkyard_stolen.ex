defmodule ShitposterBackend.GraphQL.Resolvers.Junkyard do
  import Ecto.Query
  alias Ecto.Queryable

  defp string_in_atoms(source, target, ex_args) do
    if target not in Enum.map(source, &to_string/1) do
      raise Nope, ex_args
    end

    String.to_existing_atom(target)
  end

  def orderable(queryable, %{order_by: order_arg, direction: direction} = args) do
  type_arg = Map.get(args, :type, nil)

  {field_key, assocs} =
  order_arg
      |> String.split(".")
      |> List.pop_at(-1)

    {query, last_target} =
      assocs
      |> Enum.reduce(
        {
          queryable,
          Queryable.to_query(queryable).from |> elem(1)
        },
        fn assoc_key, {query, last_target} ->
          assoc_atom =
            :associations
            |> last_target.__schema__
            |> string_in_atoms(
              assoc_key,
              detail: "invalid assoc `#{assoc_key}`"
            )

          {
            from(
              [..., l] in query,
              left_join: a in assoc(l, ^assoc_atom)
            ),
            last_target.__schema__(:association, assoc_atom).related,
          }
        end
      )

    field_atom =
      :fields
      |> last_target.__schema__
      |> string_in_atoms(
        field_key,
        detail: "invalid field `#{field_key}`"
      )

    direction_atom = String.to_existing_atom(direction)

    ordered = order_by(
      query,
      [..., l],
      {^direction_atom, field(l, ^field_atom)}
    )
    case type_arg do
      nil -> ordered
      _ -> query
      |> where(
        [..., q],
        q.type == ^type_arg
      )
    end

  end

  def orderable(query, _) do
    query
  end
end

defmodule Nope do
  defexception [:detail]

  def message(%__MODULE__{detail: detail}) do
    "Programming is not a solved problem. Clearly. #{detail}"
  end
end
