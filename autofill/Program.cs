using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FlaUI;
using FlaUI.Core.AutomationElements;
using PowerArgs;

namespace autofill
{

    public class ActionArgs
    {
        [ArgRequired, ArgDescription("Selector (XPath)"), ArgShortcut("x")]
        public string Selector { get; set; }

        [ArgRequired, ArgDescription("Target")]
        public string Target { get; set; }

        [ArgDescription("Text")]
        public string Text { get; set; }

        [ArgDescription("Launch"), ArgShortcut("l")]
        public bool Launch { get; set; }
    }

    public class Commands

    {
        [HelpHook, ArgShortcut("-h"), ArgDescription("Shows this help")]
        public bool Help { get; set; }

     
        [ArgActionMethod, ArgDescription("Text to fill")]
        public void FillText(ActionArgs args)
        {
            try
            {
                var app = FlaUI.Core.Application.Launch(args.Target);
                var automation = new FlaUI.UIA3.UIA3Automation();
                var window = app.GetMainWindow(automation);

                var textEdit = window.FindFirstByXPath(args.Selector).AsTextBox().Text = args.Text;
            }
            catch (ArgException ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

    }

    internal class Program
    {
        static void Main(string[] args)
        {
            Args.InvokeAction<Commands>(args);
        }
    }
}
