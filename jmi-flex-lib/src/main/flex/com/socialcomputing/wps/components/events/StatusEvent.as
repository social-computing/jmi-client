package com.socialcomputing.wps.components.events
{
	import flash.events.Event;
	
	public class StatusEvent extends Event
	{
		public static const STATUS:String = "status";
		
		private var _status:String;
		private var _origin:String;
		private var _code:int;
		
		public function StatusEvent(status:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(STATUS, bubbles, cancelable);
			this._status = status;
			this._origin = origin;
			this._code = code;
		}

		public function get status():String
		{
			return _status;
		}
		public function get origin():String
		{
			return _origin;
		}
		public function get code():int
		{
			return _code;
		}
	}
}