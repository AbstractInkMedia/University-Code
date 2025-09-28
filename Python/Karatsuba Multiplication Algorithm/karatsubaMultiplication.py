
### Implementation of Karatsuba Multiplication Algorithm ###


class IntegerString:
    _string : str = "";
    _int : int = 0;

    def __init__( self, value ):
        if isinstance( value, str ):
            self._string = value;
            if len( self._string ) > 0:
                self._int = int( value );
        elif isinstance( value, int ):
            self._string = str( value );
            self._int = value;
        else:
            raise TypeError( "IntegerString must be initialized with string or integer" );


    @property
    def intValue( self ):
        return self._int;


    ### NOTE: Because updating the string based on the integer value has undesired side effects i.e. loss of padding,
    ###       it is recommended to instead update the integer based on the string

    @property
    def strValue( self ):
        return self._string;

    @strValue.setter
    def strValue( self, other : str ):
        self._string = other;
        self._int = int( other );


    def __str__( self ):
        return self._string;


    def __len__( self ):
        return len( self._string );


    def __add__( self, other ):
        return IntegerString( self._int + other.intValue );


    def __sub__( self, other ):
        return IntegerString( self._int - other.intValue );


    def __mul__( self, other ):
        if isinstance( other, IntegerString ):
            return IntegerString( self._int * other.intValue );
        elif isinstance( other, int ):
            return IntegerString( self._int * other );
        else:
            return NotImplemented;

    def __rmul__( self, other ):
        return self.__mul__( other );


def GetInput( name : str ):
    rawInput : str = "";
    while True:
        rawInput = input( "Insert Integer Value For " + name + ": " );
        try:
            value = int( rawInput );
        except:
            print( "input Invalid: Non-Integer\n\n" );
            continue;
        return rawInput;


# pad value strings with leading 0s until they are of equal length, with the length being a power of 2
def Pad( value_A : IntegerString, value_B : IntegerString ):
    targetLength : int = max( len( value_A ), len( value_B ) );

    # bit shift by 1 to round up to next power of 2
    targetLength = 1 << ( targetLength - 1 ).bit_length();

    padding : str = "0" * ( targetLength - len( value_A ) );
    value_A.strValue = padding + value_A.strValue;

    padding = "0" * ( targetLength - len( value_B ) );
    value_B.strValue = padding + value_B.strValue;

    return [ value_A, value_B ];


# get the two primary variables, value_A and value_B, and ensure they are valid
def GetValueStrings():
    value_A : IntegerString = IntegerString( GetInput( "A" ) );
    value_B : IntegerString = IntegerString( GetInput( "B" ) );

    # pad input values so they are both of equal length, with the length being a power of 2
    value_A, value_B = Pad( value_A, value_B );

    return [ value_A, value_B ];


# split string in half and return the respective halves
def SplitString( intString : IntegerString ):
    halfLength : int = len( intString ) // 2;
    leftHalf : IntegerString = IntegerString( intString.strValue[ 0 : halfLength ] );
    rightHalf : IntegerString = IntegerString( intString.strValue[ halfLength : len( intString ) ] );

    return [ leftHalf, rightHalf ];


def Karatsuba_Step( leftHalf : IntegerString, rightHalf : IntegerString ):
    if len( leftHalf ) < 10 or len( rightHalf ) < 10:
        return leftHalf * rightHalf;

    # split left and right strings into their respective halves
    a, b = SplitString( leftHalf );
    c, d = SplitString( rightHalf );

    # multiply according to the Karatsuba Algorithm
    ac = Karatsuba_Step( a, c );
    bd = Karatsuba_Step( b, d );

    ad_plus_bc = Karatsuba_Step( IntegerString( a.intValue + b.intValue ), IntegerString( c.intValue + d.intValue ) );
    ad_plus_bc -= ( ac + bd );

    m = max( len( leftHalf ), len( rightHalf ) );
    m_half = m // 2;

    result : IntegerString = ( ac * 10**m ) + ( ad_plus_bc * 10**m_half ) + bd;
    return result;


def KaratsubaMultiplication( value_A : IntegerString, value_B : IntegerString ):
    result : IntegerString = Karatsuba_Step( value_A, value_B );
    return result;


def Main():
    value_A : IntegerString = IntegerString( "" );
    value_B : IntegerString = IntegerString( "" );
    product_AB : IntegerString = IntegerString( "" )

    print( "Karatsuba Integer Multiplication Algorithm:\n" );

    while True:
        value_A, value_B = GetValueStrings();

        product_AB = KaratsubaMultiplication( value_A, value_B );

        print( "A * B = ", product_AB );

        check = input( "\n\nRepeat? Y/N\n" ).upper();
        if check == "Y":
            print("\n");
            continue;
        else:
            break;


Main();