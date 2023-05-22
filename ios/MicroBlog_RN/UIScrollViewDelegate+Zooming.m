//
//  UIScrollViewDelegate+Zooming.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/27/23.
//

#import "UIScrollViewDelegate+Zooming.h"

@implementation NSObject (Zooming)

- (void) scrollViewWillBeginZooming:(UIScrollView *)scrollView withView:(UIView *)view
{
  scrollView.pinchGestureRecognizer.enabled = NO;
}

@end
