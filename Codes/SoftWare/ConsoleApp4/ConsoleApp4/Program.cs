using System;
using System.IO;
using System.Net;
using System.Linq;
using System.Text;
using System.Management;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;

namespace software
{

    class Program
    {


        [DllImport("user32.dll")]
        public static extern void keybd_event(byte virtualKey, byte scanCode, uint flags, IntPtr extraInfo);


        static void Main(string[] args)
        {

         const int KEYEVENTF_EXTENTEDKEY = 1;
         const int KEYEVENTF_KEYUP = 0;
         const int VK_MEDIA_NEXT_TRACK = 0xB0;
         const int VK_MEDIA_PLAY_PAUSE = 0xB3;
         const int VK_MEDIA_PREV_TRACK = 0xB1;

         const int VK_VOLUME_DOWN = 0xAE;
         const int VK_VOLUME_UP = 0xAF;



            string processor = "";
            ManagementObjectSearcher myProcessorObject = new ManagementObjectSearcher("select * from Win32_Processor");

            foreach (ManagementObject obj in myProcessorObject.Get())
               processor = obj["Name"].ToString();

           


            string Query = "SELECT Capacity FROM Win32_PhysicalMemory";
            ManagementObjectSearcher searcher = new ManagementObjectSearcher(Query);

            UInt64 Capacity = 0;
            foreach (ManagementObject WniPART in searcher.Get())
            {
                Capacity += Convert.ToUInt64(WniPART.Properties["Capacity"].Value);
            }

            string memory = (Capacity / (1024.0 * 1024.0)).ToString();


            // Create a DriveInfo instance of the D:\ drive
            DriveInfo dInfo = new DriveInfo("C");

            StringBuilder hdInfo = new StringBuilder();

            // When the drive is accessible..
            hdInfo.AppendFormat("Total space: {0:0.00} GB\n", dInfo.TotalSize / Math.Pow(1024.0, 3));
            hdInfo.AppendFormat("Free disk space: {0:0.00} GB\n", dInfo.AvailableFreeSpace / Math.Pow(1024.0, 3));
            hdInfo.AppendFormat("Free space (percentage): {0:0.00}%\n", ((dInfo.AvailableFreeSpace / (float)dInfo.TotalSize) * 100));



            BasicInfo myInfo = new BasicInfo
            {
                OsVersion = (from x in new ManagementObjectSearcher("SELECT Caption FROM Win32_OperatingSystem").Get().Cast<ManagementObject>()
                             select x.GetPropertyValue("Caption")).FirstOrDefault().ToString(),
                Os64 = Environment.Is64BitOperatingSystem,
                PcName = Environment.MachineName,
                processorName = processor,
                HddSpace = hdInfo.ToString(),
                RamSize = memory

            };

           

                Console.WriteLine(myInfo);


            getRequest( "http://192.168.1.193:5000/functions/userSoft/n4xHw&2z11?information="+myInfo );    // Contact webserver with string "myInfo"


            int first = 1;

            // Loop where toggle is checked.
            string data;
            while (true)
            {

                data = getRequest("http://192.168.1.193:5000/functions/userToggles/n4xHw&2z11");           // Contact webserver to check toggle.


                // Ignore to read from web server on program start.
                if (first == 1) {

                    data = "0";
                    first = 0;

                }

                if (data == "1")
                {

                    Process.Start("shutdown", "/s /t 0");      // Shutdown pc in 50 s.

                }
                else if (data == "2")
                {

                    Process.Start("shutdown", "/r /t 0");      // Restart pc in 50 s.

                }else if(data == "3")
                {
                   
                    keybd_event(VK_MEDIA_PREV_TRACK, 0, KEYEVENTF_EXTENTEDKEY, IntPtr.Zero);  // PrevTrack
              
                }
                else if(data == "4")
                {

                    keybd_event(VK_MEDIA_PLAY_PAUSE, 0, KEYEVENTF_EXTENTEDKEY, IntPtr.Zero);    // Play/Pause

                }else if(data == "5")
                {

                    keybd_event(VK_MEDIA_NEXT_TRACK, 0, KEYEVENTF_EXTENTEDKEY, IntPtr.Zero);  // NextTrack

                }
                else if (data == "6")
                {
                    for(int x = 0; x < 20; x++)
                        keybd_event(VK_VOLUME_DOWN, 0, KEYEVENTF_EXTENTEDKEY, IntPtr.Zero);    // VOLUME DOWN
                   
                }
                else if (data == "7")
                {
                    for (int x = 0; x < 20; x++)
                        keybd_event(VK_VOLUME_UP, 0, KEYEVENTF_EXTENTEDKEY, IntPtr.Zero);  // VOLUME UP

                }


                Console.WriteLine(data);
                Thread.Sleep(1000);
               
            }


        }



        public static string getRequest(string url)
        {

            var data = "0";
           try 
            {
                // Error: Use of unassigned local variable 'n'.
                var request = WebRequest.Create(url);
                request.Method = "GET";
                var webResponse = request.GetResponse();
                var webStream = webResponse.GetResponseStream();
                var reader = new StreamReader(webStream);

                data = reader.ReadToEnd();
            }
            catch
            {

                data = "Server is offline";

            }

            return data;

        }


    }

    public class BasicInfo
    {
        public string OsVersion { get; set; }
        public bool Os64 { get; set; }
        public string PcName { get; set; }
        public string processorName { get; set; }
        public string HddSpace { get; set; }

        public string RamSize { get; set; }


        public override string ToString()
        {
            StringBuilder output = new StringBuilder();
            output.AppendFormat("Windows Version: {0}\n\n", OsVersion);
            output.AppendFormat("64 Bit operating system?: {0}\n\n", Os64 ? "Yes" : "No");
            output.AppendFormat("Pc Name: {0}\n\n", PcName);
            output.AppendFormat("CPU Name: {0}\n\n", processorName);
            output.AppendFormat("RAM Size: {0} MB\n\n", RamSize);
            output.AppendFormat(HddSpace);


            return output.ToString();
        }
    }



}