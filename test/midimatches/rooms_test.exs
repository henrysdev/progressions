defmodule Midimatches.RoomsTest do
  use ExUnit.Case

  alias Midimatches.{
    Pids,
    Rooms,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up entire supervision tree" do
    room_ids = ["1", "asdf", "3"]
    room_names = ["name1", "name2", "name3"]
    room_tuples = Enum.zip(room_ids, room_names)

    Enum.each(room_tuples, fn {id, name} -> Rooms.add_room(id, name) end)

    Enum.each(room_ids, fn id ->
      assert Rooms.room_exists?(id) == true
    end)

    assert length(Rooms.list_rooms()) == length(room_ids)
  end

  test "prevents duplicate room ids" do
    room_ids = ["1", "asdf", "1"]
    room_names = ["name1", "name2", "name1"]
    room_tuples = Enum.zip(room_ids, room_names)

    [err_result | _rest] =
      room_tuples
      |> Enum.map(fn {id, name} -> Rooms.add_room(id, name) end)
      |> Enum.reverse()

    :sys.get_state(Rooms)

    assert {:error, "room already exists for room_id 1"} == err_result
    assert length(Rooms.list_rooms()) == length(room_ids) - 1
  end

  test "adding and dropping children from tree removes from children and registry" do
    room_ids = ["1", "2", "3"]
    room_names = ["name1", "name2", "name3"]
    room_tuples = Enum.zip(room_ids, room_names)

    Enum.each(room_tuples, fn {id, name} -> Rooms.add_room(id, name) end)

    :sys.get_state(Rooms)
    :sys.get_state(ProcessRegistry)

    assert length(Rooms.list_rooms()) == length(room_ids)
    assert Pids.fetch({:room_supervisor, "2"}) != nil

    Rooms.drop_room("2")

    :sys.get_state(Rooms)
    :sys.get_state(ProcessRegistry)

    assert Pids.fetch({:room_supervisor, "2"}) == nil
    assert Pids.fetch({:game_server, "2"}) == nil
    assert length(Rooms.list_rooms()) == length(room_ids) - 1
  end
end
