defmodule Midimatches.RoomTest do
  use ExUnit.Case

  alias Midimatches.{
    ChatServer,
    Rooms.Room,
    Rooms.RoomServer,
    TestHelpers
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up supervision tree" do
    room_id = "1"
    room_name = "yuzu"

    {:ok, sup} = start_supervised({Room, [{room_id, room_name}]})

    started_children = Supervisor.which_children(sup) |> Enum.reverse()

    assert [
             {RoomServer, _, :worker, [RoomServer]},
             {ChatServer, _, :worker, [ChatServer]}
           ] = started_children
  end
end
