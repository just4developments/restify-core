x=0
y=0
function usage()
{
	echo "if this was a real script you would see something useful here"
	echo ""
	echo "./sum.sh"
	echo "\t-x=$x"
	echo "\t-y=$y"
	echo ""
}
while [ "$1" != "" ]; do
	PARAM=`echo $1 | awk -F= '{print $1}'`
	VALUE=`echo $1 | awk -F= '{print $2}'`
	case $PARAM in
		-x)
			x=$VALUE
			;;
		-y)
			y=$VALUE
			;;
		*)
			echo "ERROR: unknown parameter \"$PARAM\""
			usage
			exit 1
			;;
	esac
	shift
done
#echo "X is $x";
#echo "Y is $y";

sum=$(expr "$x" + "$y")
echo "x:$x"
echo "y:$y"
echo "sum:$sum"